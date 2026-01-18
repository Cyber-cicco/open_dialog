use anyhow::Result;
use tauri::State;

use crate::shared::{state::AppState, types::character::Character};

pub mod service;

pub fn create_character<'a>(project_path:&str, name:&str, state:State<'a, AppState>) -> Result<Character> {

}
