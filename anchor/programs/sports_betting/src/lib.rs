#![allow(clippy::result_large_err)]

use anchor_lang::prelude::*;
use anchor_lang::solana_program::system_program;

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
        team: u8, // 0 for team A, 1 for team B
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
    pub pot_account: UncheckedAccount<'info>,

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
    pub team: u8, // 0 for team A, 1 for team B
}

#[account]
#[derive(InitSpace)]
pub struct SportsBetting {
    pub bump: u8,
    pub pot_bump: u8,

    #[max_len = 32]
    pub team_a_name: String,

    #[max_len = 32]
    pub team_b_name: String,

    #[max_len = 100]
    pub winners: Vec<Winners>,

    #[max_len = 100]
    pub bettors: Vec<Bettor>,

    pub game_start: u64,
    pub game_end: u64,
    pub status: u8, // 0 for not started, 1 for in progress, 2 for ended

    pub pot: u64,    

    pub admin: Pubkey,
}

#[error_code]
pub enum SportsError {
    #[msg("Betting is closed")]         BettingClosed,
    #[msg("Invalid team ID")]           InvalidTeam,
    #[msg("Max bettors reached")]       MaxBettorsReached,
    #[msg("Insufficient pot")]          InsufficientPot,
    #[msg("Game already settled")]      GameSettled,
    #[msg("You have nothing to claim")] NothingToClaim,
}
