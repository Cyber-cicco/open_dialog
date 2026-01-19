use crate::shared::types::dialog::{Dialog, DialogCreationForm, DialogMetadata};
use od_macros::tauri_command;

pub mod dao;
pub mod service;

#[tauri_command(dialog_service)]
pub fn create_dialog(project_id: &str, form: DialogCreationForm) {}

#[tauri_command(dialog_service)]
pub fn get_dialog_by_id(project_id: &str, dialog_id: &str) -> Dialog {}

#[tauri_command(dialog_service)]
pub fn get_dialog_metadata(project_id: &str) -> DialogMetadata {}

#[tauri_command(dialog_service)]
pub fn save_dialog(project_id: &str, dialog: Dialog) {}

#[tauri_command(dialog_service)]
pub fn save_dialog_content(dialog_id: &str, content: &str) {}
