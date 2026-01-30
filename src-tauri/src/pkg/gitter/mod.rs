use od_macros::tauri_command;
use uuid::Uuid;

use crate::shared::types::gitter::CommitGraph;

pub mod service;

#[tauri_command(git_service)]
pub fn get_logs(project_id: Uuid) -> CommitGraph {}

#[tauri_command(git_service)]
pub fn commit(project_id: Uuid, message: &str) {}
