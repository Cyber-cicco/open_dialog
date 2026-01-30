use crate::shared::types::character::{Character, CharacterForm, CharacterMetadata, ImageField};
use od_macros::tauri_command;
use uuid::Uuid;

pub mod dao;
pub mod service;

#[tauri_command(character_service)]
pub fn create_character(project_id: &str, name: &str, order: usize) -> Character {}

#[tauri_command(character_service)]
pub fn change_character(project_id: &str, char_form: CharacterForm) -> Character {}

#[tauri_command(character_service)]
pub fn upload_image(project_id: &str, char_id: &str, path: &str, field: ImageField) -> () {}

#[tauri_command(character_service)]
pub fn get_all_characters(project_id: &str) -> CharacterMetadata {}

#[tauri_command(character_service)]
pub fn persist_metadata(project_id: &str, metadata: CharacterMetadata) {}

#[tauri_command(character_service)]
pub fn get_character_by_id(project_id: &str, character_id: Uuid) -> Character {}
