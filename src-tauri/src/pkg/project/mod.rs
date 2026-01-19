pub mod service;

use std::sync::{Arc, RwLock};

use od_macros::tauri_command;
use crate::shared::types::project::{AtomicProjects, Project};

#[tauri_command(project_service)]
pub fn create_project(name: &str) -> Arc<RwLock<Project>> {}

#[tauri_command(project_service)]
pub fn get_projects() -> AtomicProjects {}
