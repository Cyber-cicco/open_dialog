use od_macros::tauri_command;

use crate::shared::types::variables::VariableStore;

pub mod service;
pub mod dao;

#[tauri_command(var_service)]
pub fn load_variables(project_id: &str) -> VariableStore {}
#[tauri_command(var_service)]
pub fn persist_variables(project_id: &str, vars: VariableStore) {}
