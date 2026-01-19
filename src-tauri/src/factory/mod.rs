use crate::pkg::character::dao::FileCharacterDao;
use crate::pkg::character::service::CharacterServiceLocalImpl;
use crate::pkg::project::service::ProjectServiceLocaleImpl;
use crate::shared::types::interfaces::{FSUploader, Shared};
use crate::shared::{
    config::{ODConfig, ODConfigLocal},
    state::AppState,
};
use anyhow::Result;
use std::sync::Arc;

pub fn init_local_app_state() -> Result<AppState> {
    let config = ODConfigLocal::init()?;
    let uploader = FSUploader {};
    let uploader_ref = Arc::new(uploader);
    let shared_conf = Shared::new(config);
    let character_dao = FileCharacterDao::new(shared_conf.clone());

    Ok(AppState {
        project_service: ProjectServiceLocaleImpl::new(shared_conf.clone()),
        character_service: CharacterServiceLocalImpl::new(
            shared_conf.clone(),
            Arc::new(character_dao),
            uploader_ref,
        ),
    })
}
