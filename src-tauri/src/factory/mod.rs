use crate::pkg::character::service::CharacterServiceLocalImpl;
use crate::pkg::project::service::ProjectServiceLocaleImpl;
use crate::shared::types::interfaces::{FSUploader, Shared};
use crate::shared::{
    config::{ODConfig, ODConfigLocal},
    state::AppState,
};
use anyhow::Result;
use std::sync::{Arc, Mutex};

pub fn init_local_app_state() -> Result<AppState> {
    let config = ODConfigLocal::init()?;
    let uploader = FSUploader{};
    let uploader_ref = Arc::new(uploader);
    let shared_conf = Shared::new(config);
    let project_service = ProjectServiceLocaleImpl::new(shared_conf.clone());
    let character_service = CharacterServiceLocalImpl::new(shared_conf.clone(), uploader_ref);

    Ok(AppState {
        project_service: Mutex::new(project_service),
        character_service: Mutex::new(character_service),
    })
}
