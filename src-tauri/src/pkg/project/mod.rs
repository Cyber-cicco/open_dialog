pub mod service;

use std::sync::{Arc, RwLock};

use tauri::{command, State};

use crate::shared::{state::AppState, types::project::{AtomicProjects, Project}};

#[command]
pub fn create_project<'a>(name: &str, state: State<'a, AppState>) -> Result<Arc<RwLock<Project>>, String> {
    state.project_service
        .lock()
        .map_err(|e| e.to_string())?
        .post_project(name)
        .map_err(|e| e.to_string())
}

#[command]
pub fn get_projects<'a>(state: State<'a, AppState>) -> Result<AtomicProjects, String> {
    let res = state.project_service
        .lock()
        .map_err(|e| e.to_string())?
        .get_projects();
    return Ok(res);
}
