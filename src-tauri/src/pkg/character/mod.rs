use tauri::State;

use crate::shared::{
    state::AppState,
    types::character::{Character, CharacterForm},
};

pub mod dao;
pub mod service;

#[tauri::command]
pub fn create_character<'a>(
    project_id: &str,
    name: &str,
    state: State<'a, AppState>,
) -> Result<Character, String> {
    state
        .character_service
        .create_character(project_id, name)
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub fn change_character<'a>(
    project_id: &str,
    char_form: CharacterForm,
    state: State<'a, AppState>,
) -> Result<Character, String> {
    state
        .character_service
        .change_character(project_id, char_form)
        .map_err(|e| e.to_string())
}
