use crate::shared::types::dialog::{Dialog, DialogCreationForm, DialogMetadata};
use od_macros::tauri_command;
use uuid::Uuid;

pub mod dao;
pub mod service;

#[tauri_command(dialog_service)]
pub fn create_dialog(project_id: &str, form: DialogCreationForm) {}

#[tauri_command(dialog_service)]
pub fn get_dialog_by_id(project_id: &str, dialog_id: Uuid) -> Dialog {}

#[tauri_command(dialog_service)]
pub fn get_dialog_metadata(project_id: &str) -> DialogMetadata {}

#[tauri_command(dialog_service)]
pub fn save_dialog(project_id: &str, dialog: Dialog) {}

#[tauri_command(dialog_service)]
pub fn save_dialog_content(project_id: &str, dialog_id: Uuid, node_id: Uuid, content: &str) {}

#[tauri_command(dialog_service)]
pub fn save_dialog_metadata(project_id: &str, dialog_metadata: DialogMetadata) {}

#[tauri_command(dialog_service)]
pub fn delete_dialog(project_id: &str, dialog_id: Uuid) {}
