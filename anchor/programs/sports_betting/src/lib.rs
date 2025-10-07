#![allow(clippy::result_large_err)]

use anchor_lang::prelude::*;
use anchor_lang::system_program;

declare_id!("Count3AcZucFDPSFBAeHkQ6AvttieKUkyJ8HiQGhQwe");

#[program]
pub mod sports_betting {
    use super::*;

    pub fn initialize_config(
        ctx: Context<InitializeConfig>,
        team_a: String,
        team_b: String,
        start: u64,
        end: u64,
    ) -> Result<()> {
        let sb = &mut ctx.accounts.sports_betting;
    
        sb.bump = ctx.bumps.sports_betting;
        sb.pot_bump = *ctx.bumps.get("pot_account").unwrap();
        sb.team_a_name = team_a;
        sb.team_b_name = team_b;
        sb.game_start = start;
        sb.game_end = end;
        sb.pot = 0;
        sb.admin = ctx.accounts.payer.key();
        sb.status = 0;
        Ok(())
    }


    pub fn place_bet(
        ctx: Context<PlaceBet>,
        amount: u64,
        team: u8, // 0 = team A, 1 = team B
    ) -> Result<()> {
        let sb = &mut ctx.accounts.sports_betting;

        require!(sb.status == 0, SportsError::BettingClosed);

        require!(Clock::get()?.unix_timestamp < sb.game_start as i64, SportsError::BettingClosed);

        system_program::transfer(
            CpiContext::new(
                ctx.accounts.system_program.to_account_info(),
                system_program::Transfer {
                    from: ctx.accounts.bettor.to_account_info(),
                    to: ctx.accounts.pot_account.to_account_info(),
                },
            ),
            amount,
        )?;

        sb.pot = sb.pot.checked_add(amount).unwrap();

        sb.bettors.push(Bettor {
            wallet: ctx.accounts.bettor.key(),
            amount,
            team,
        });

        Ok(())
    }

    pub fn end_game(
        ctx: Context<EndGame>, 
        winning_team: u8
    ) -> Result<()>{
        let sb = &mut ctx.accounts.sports_betting;

        require_keys_eq!(ctx.accounts.admin.key(), sb.admin, SportsError::Unauthorized);
        require!(sb.status == 0 || sb.status == 1, SportsError::GameSettled);
        require!(winning_team <= 1, SportsError::InvalidTeam);

        sb.status = 2;
        sb.winning_team = Some(winning_team);

        Ok(())
    }

    pub fn claim_rewards(
        ctx: Context<ClaimReward>
    ) -> Result<()>{
        let sb = &mut ctx.accounts.sports_betting;

        require!(sb.status == 2, SportsError::GameNotEnded);
        let winning_team = sb.winning_team.ok_or(SportsError::GameNotEnded)?;

        let bettor_index = sb.bettors.iter().position(|b| b.wallet == ctx.accounts.bettor.key());
        require!(bettor_index.is_some(), SportsError::NothingToClaim);

        let bettor = &sb.bettors[bettor_index.unwrap()];
        require!(bettor.team == winning_team, SportsError::NothingToClaim);

        let total_winner_amount: u64 = sb.bettors.iter().filter(|b| b.team == winning_team).map(|b| b.amount).sum();

        let payout = (sb.pot as u128).checked_mul(bettor.amount as u128).unwrap().checked_div(total_winner_amount as u128).unwrap() as u64;

        let pot_account_info = ctx.accounts.pot_account.to_account_info();
        let bettor_info = ctx.accounts.bettor.to_account_info();
        let system_program = ctx.accounts.system_program.to_account_info();

        let seeds = &[
            b"pot",
            sb.key().as_ref(),
            &[sb.pot_bump],
        ];
        let signer_seeds = &[&seeds[..]];

        system_program::transfer(
            CpiContext::new_with_signer(
                system_program,
                system_program::Transfer {
                    from: pot_account_info,
                    to: bettor_info,
                },
                signer_seeds,
            ),
            payout,
        )?;
        Ok(())
    }
}   


#[derive(Accounts)]
pub struct PlaceBet<'info> {
    #[account(mut)]
    pub bettor: Signer<'info>,

    #[account(mut)]
    pub sports_betting: Account<'info, SportsBetting>,

    #[account(
        mut,
        seeds = [b"pot", sports_betting.key().as_ref()],
        bump = sports_betting.pot_bump
    )]
    pub pot_account: SystemAccount<'info>,


    pub system_program: Program<'info, System>,

}

#[derive(Accounts)]
pub struct EndGame<'info> {
    #[account(mut)]
    pub admin: Signer<'info>,

    #[account(mut)]
    pub sports_betting: Account<'info, SportsBetting>,
}

#[derive(Accounts)]
pub struct ClaimReward<'info> {
    #[account(mut)]
    pub bettor: Signer<'info>,

    #[account(mut)]
    pub sports_betting: Account<'info, SportsBetting>,

    #[account(
        mut,
        seeds = [b"pot", sports_betting.key().as_ref()],
        bump = sports_betting.pot_bump
    )]
    pub pot_account: SystemAccount<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct InitializeConfig<'info>{
    #[account(mut)]
    pub payer: Signer<'info>,

    #[account(
        init, 
        payer = payer,
        space = 8 + SportsBetting::INIT_SPACE,
        seeds = [b"sports_betting".as_ref()],
        bump
    )]
    pub sports_betting: Account<'info, SportsBetting>,

    #[account( 
        init, 
        payer = payer, 
        seeds = [b"pot", sports_betting.key().as_ref()],
        bump, 
        space  = 0
    )]
    pub pot_account: UncheckedAccount<'info>,

    pub system_program: Program<'info, System>, 
}

#[derive(AnchorSerialize, AnchorDeserialize, InitSpace)]
pub struct Winners {
    pub wallet: Pubkey,
    pub amount: u64,
}

#[derive(AnchorSerialize, AnchorDeserialize, InitSpace)]
pub struct Bettor {
    pub wallet: Pubkey,
    pub amount: u64,
    pub team: u8, // 0 = team A, 1 = team B
}

#[account]
#[derive(InitSpace)]
pub struct SportsBetting {
    pub bump: u8,
    pub pot_bump: u8,

    #[max_len(32)]
    pub team_a_name: String,

    #[max_len(32)]
    pub team_b_name: String,

    #[max_len(100)]
    pub winners: Vec<Winners>,

    #[max_len(100)]
    pub bettors: Vec<Bettor>,

    pub game_start: u64,
    pub game_end: u64,
    pub status: u8, // 0 = not started, 1 = in progress, 2 = ended
    pub winning_team: Option<u8>, // 0 = A, 1 = B

    pub pot: u64,    

    pub admin: Pubkey,
}

#[error_code]
pub enum SportsError {
    #[msg("Betting is closed")]         
    BettingClosed,
    #[msg("Invalid team ID")]           
    InvalidTeam,
    #[msg("Max bettors reached")]       
    MaxBettorsReached,
    #[msg("Insufficient pot")]          
    InsufficientPot,
    #[msg("Game already settled")]      
    GameSettled,
    #[msg("You have nothing to claim")] 
    NothingToClaim,
    #[msg("Unauthorized")]              
    Unauthorized,
    #[msg("Game has not ended yet")]    
    GameNotEnded,
    #[msg("Overflow error")]            
    Overflow,
}


