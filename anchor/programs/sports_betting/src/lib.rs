#![allow(clippy::result_large_err)]

use anchor_lang::prelude::*;

declare_id!("Count3AcZucFDPSFBAeHkQ6AvttieKUkyJ8HiQGhQwe");

#[program]
pub mod sports_betting {
    use super::*;

    pub fn initialize_config(
        ctx: Context<InitializeConfig>, 
        team_a: String,
        team_b: String,
        start: u64,
        end: u64
    ) -> Result<()> {
        ctx.accounts.sports_betting.bump = ctx.bumps.sports_betting;
        ctx.accounts.sports_betting.team_a_name = team_a;
        ctx.accounts.sports_betting.team_b_name = team_b;
        ctx.accounts.sports_betting.game_start = start;
        ctx.accounts.sports_betting.game_end = end;
        ctx.accounts.sports_betting.pot = 0;
        ctx.accounts.sports_betting.admin = ctx.accounts.payer.key;
        ctx.accounts.sports_betting.status = 0;
        Ok(())
    }
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

    pub system_program: Program<'info, System>, 
}

pub struct InitializeBetting<'info>{
    #[account(mut)]
    pub bettor: Signer<'info>,

    pub sports_betting: Account<'info, SportsBetting>,

    #[account(
        mut,
        seeds = [b"sports_betting".as_ref()],
        bump,
    )]
    pub pot_account: UncheckedAccount<'info>,,

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

    #[max_len = 32]
    pub team_a_name: String,

    #[max_len = 32]
    pub team_b_name: String,

    #[max_len = 200]
    pub winners: Vec<Winners>,

    #[max_len = 200]
    pub bettors: Vec<Bettor>,

    pub game_start: u64,
    pub game_end: u64,
    pub status: u8, // 0 for not started, 1 for in progress, 2 for ended

    pub pot: u64,    

    pub admin: Pubkey,
}
