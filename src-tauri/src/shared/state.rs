use std::sync::Mutex;
use crate::pkg::character::service::CharacterServiceLocalImpl;
use crate::pkg::project::service::ProjectServiceLocaleImpl;
use crate::shared::config::ODConfigLocal;
use crate::shared::types::interfaces::FSUploader;

pub struct AppState {
    pub project_service: Mutex<ProjectServiceLocaleImpl<ODConfigLocal>>,
    pub character_service: Mutex<CharacterServiceLocalImpl<ODConfigLocal>>,
}
