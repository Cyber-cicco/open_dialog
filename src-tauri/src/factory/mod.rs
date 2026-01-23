use crate::pkg::character::dao::FileCharacterDao;
use crate::pkg::character::service::CharacterServiceLocalImpl;
use crate::pkg::dialog::dao::FileDialogDao;
use crate::pkg::dialog::service::DialogServiceLocalImpl;
use crate::pkg::meta::dao::FileMetaDao;
use crate::pkg::meta::service::MetaServiceLocalImpl;
use crate::pkg::project::service::ProjectServiceLocaleImpl;
use crate::pkg::variables::dao::FileVariableDao;
use crate::pkg::variables::service::VariableServiceLocalImpl;
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
    let character_dao = Arc::new(FileCharacterDao::new(shared_conf.clone()));
    let var_dao = Arc::new(FileVariableDao::new(shared_conf.clone()));
    let dialog_dao = Arc::new(FileDialogDao::new(shared_conf.clone()));
    let meta_dao = Arc::new(FileMetaDao::new(shared_conf.clone()));
    let meta_srv = MetaServiceLocalImpl::new(shared_conf.clone(), meta_dao.clone());

    Ok(AppState {
        project_service: ProjectServiceLocaleImpl::new(shared_conf.clone()),
        character_service: CharacterServiceLocalImpl::new(
            shared_conf.clone(),
            character_dao.clone(),
            uploader_ref,
        ),
        dialog_service: DialogServiceLocalImpl::new(
            shared_conf.clone(),
            dialog_dao.clone(),
            character_dao.clone(),
            meta_srv,
        ),
        var_service: VariableServiceLocalImpl::new(
            shared_conf.clone(),
            var_dao.clone(),
            character_dao.clone(),
            dialog_dao.clone(),
        ),
    })
}
