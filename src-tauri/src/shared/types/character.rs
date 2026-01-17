use std::path::Path;

use anyhow::{bail, Result};
use ts_rs::TS;
use uuid::Uuid;

use crate::shared::types::interfaces::Uploader;

/// Character is created by the user
/// to represent a actor that can
/// interact in dialogs.
/// Character has a mandatory name, and
/// can have a description, a portrait,
/// a general artwork and a background image.
/// It is always linked to a project and it's
/// stats
#[derive(TS)]
#[ts(export, export_to = "../../src/bindings/")]
#[derive(Debug)]
pub struct Character {
    id: Uuid,
    full_name: String,
    pub description: Option<String>,
    portrait_link: Option<Uuid>,
    artwork_link: Option<Uuid>,
    background_link: Option<Uuid>,
    project_id: Uuid,
}

impl Character {
    pub fn new(full_name: &str, project_id: Uuid) -> Result<Self> {
        let id = Uuid::new_v4();
        if full_name.len() < 1 {
            bail!("Name cannot be blank.")
        }
        Ok(Character {
            id,
            full_name: String::from(full_name),
            description: None,
            portrait_link: None,
            artwork_link: None,
            background_link: None,
            project_id,
        })
    }

    pub fn upload_portrait<U: Uploader>(
        &mut self,
        from: String,
        to: &Path,
        uploader: U,
    ) -> Result<()> {
        let uuid = uploader.updload(from, to)?;
        self.portrait_link = Some(uuid);
        return Ok(());
    }

    pub fn upload_artwork<U: Uploader>(
        &mut self,
        from: String,
        to: &Path,
        uploader: U,
    ) -> Result<()> {
        let uuid = uploader.updload(from, to)?;
        self.artwork_link = Some(uuid);
        return Ok(());
    }

    pub fn upload_background_link<U: Uploader>(
        &mut self,
        from: String,
        to: &Path,
        uploader: U,
    ) -> Result<()> {
        let uuid = uploader.updload(from, to)?;
        self.background_link = Some(uuid);
        return Ok(());
    }

    pub fn get_name(&self) -> &String {
        return &self.full_name;
    }
}
