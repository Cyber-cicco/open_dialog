use tauri::State;

use crate::shared::{state::AppState, types::character::Character};

pub mod service;

#[tauri::command]
pub fn create_character<'a>(project_id:&str, name:&str, state:State<'a, AppState>) -> Result<Character, String> {
    state.character_service
        .lock()
        .map_err(|e| e.to_string())?
        .create_character(project_id, name)
        .map_err(|e| e.to_string())
}
