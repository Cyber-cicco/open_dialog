use od_macros::tauri_command;

use crate::shared::types::variables::VariableStore;

pub mod dao;
pub mod service;

#[tauri_command(var_service)]
pub fn load_variables(project_id: &str) -> VariableStore {}
#[tauri_command(var_service)]
pub fn persist_variables(project_id: &str, vars: VariableStore)  {}
#[tauri_command(var_service)]
pub fn delete_variable(project_id: &str, var_id: &str) {}
