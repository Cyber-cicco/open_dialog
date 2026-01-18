use crate::pkg::character::service::CharacterServiceLocalImpl;
use crate::pkg::project::service::ProjectServiceLocaleImpl;
use crate::shared::{
    config::{ODConfig, ODConfigLocal},
    state::AppState,
};
use anyhow::Result;
use std::sync::{Arc, Mutex};

pub fn init_local_app_state() -> Result<AppState> {
    let config = ODConfigLocal::init()?;
    let conf_ref = Arc::new(Mutex::new(config));
    let project_service = ProjectServiceLocaleImpl::new(conf_ref.clone());
    let character_service = CharacterServiceLocalImpl::new(conf_ref.clone());

    Ok(AppState {
        project_service: Mutex::new(project_service),
        character_service: Mutex::new(character_service),
    })
}
