use tauri::{State};

use crate::shared::{
    state::AppState,
    types::character::{Character, CharacterForm, ImageField},
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

#[tauri::command]
pub fn upload_image<'a>(
    project_id: &str,
    char_id: &str,
    path:&str,
    field:ImageField,
    state: State<'a, AppState>,
) -> Result<(), String> {
    state
        .character_service
        .upload_image(project_id, char_id, path, field)
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub fn get_all_characters<'a>(
    project_id: &str,
    state: State<'a, AppState>,
) -> Result<Vec<Character>, String> {
    state
        .character_service
        .get_all_characters(project_id)
        .map_err(|e| e.to_string())
}
