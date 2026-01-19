use tauri::State;

use crate::shared::{state::AppState, types::dialog::DialogCreationForm};

pub mod dao;
pub mod service;

#[tauri::command]
pub fn create_dialog<'a>(
    project_id: &str,
    form: DialogCreationForm,
    state: State<'a, AppState>,
) -> Result<(), String> {
    state
        .dialog_service
        .create_dialog(project_id, form)
        .map_err(|e| e.to_string())
}
