#![allow(clippy::result_large_err)]

use anchor_lang::prelude::*;

declare_id!("coUnmi3oBUtwtd9fjeAvSsJssXh5A5xyPbhpewyzRVF");

#[program]
pub mod votingsystem {
    use super::*;

  pub fn close(_ctx: Context<CloseVotingsystem>) -> Result<()> {
    Ok(())
  }

  pub fn decrement(ctx: Context<Update>) -> Result<()> {
    ctx.accounts.votingsystem.count = ctx.accounts.votingsystem.count.checked_sub(1).unwrap();
    Ok(())
  }

  pub fn increment(ctx: Context<Update>) -> Result<()> {
    ctx.accounts.votingsystem.count = ctx.accounts.votingsystem.count.checked_add(1).unwrap();
    Ok(())
  }

  pub fn initialize(_ctx: Context<InitializeVotingsystem>) -> Result<()> {
    Ok(())
  }

  pub fn set(ctx: Context<Update>, value: u8) -> Result<()> {
    ctx.accounts.votingsystem.count = value.clone();
    Ok(())
  }
}

#[derive(Accounts)]
pub struct InitializeVotingsystem<'info> {
  #[account(mut)]
  pub payer: Signer<'info>,

  #[account(
  init,
  space = 8 + Votingsystem::INIT_SPACE,
  payer = payer
  )]
  pub votingsystem: Account<'info, Votingsystem>,
  pub system_program: Program<'info, System>,
}
#[derive(Accounts)]
pub struct CloseVotingsystem<'info> {
  #[account(mut)]
  pub payer: Signer<'info>,

  #[account(
  mut,
  close = payer, // close account and return lamports to payer
  )]
  pub votingsystem: Account<'info, Votingsystem>,
}

#[derive(Accounts)]
pub struct Update<'info> {
  #[account(mut)]
  pub votingsystem: Account<'info, Votingsystem>,
}

#[account]
#[derive(InitSpace)]
pub struct Votingsystem {
  count: u8,
}
