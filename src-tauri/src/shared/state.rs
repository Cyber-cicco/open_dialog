use crate::pkg::character::dao::{FileCharacterDao};
use crate::pkg::character::service::CharacterServiceLocalImpl;
use crate::pkg::project::service::ProjectServiceLocaleImpl;
use crate::shared::config::ODConfigLocal;

pub struct AppState {
    pub project_service: ProjectServiceLocaleImpl<ODConfigLocal>,
    pub character_service: CharacterServiceLocalImpl<ODConfigLocal, FileCharacterDao<ODConfigLocal>>,
}
