use crate::pkg::character::service::CharacterServiceLocalImpl;
use crate::pkg::project::service::ProjectServiceLocaleImpl;
use crate::shared::{
    config::{ODConfig, ODConfigLocal},
    state::AppState,
    types::interfaces::FSUploader,
};
use anyhow::Result;
use std::sync::Mutex;

pub fn init_local_app_state() -> Result<AppState> {
    let config = ODConfigLocal::init()?;
    let uploader = FSUploader {};
    let project_service = ProjectServiceLocaleImpl::new(&uploader, &mut config);
    let character_service = CharacterServiceLocalImpl::new(&uploader, &mut config);

    Ok(AppState {
        project_service: Mutex::new(project_service),
        character_service: Mutex::new(character_service),
    })
}
