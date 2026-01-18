use std::path::{Path, PathBuf};

use anyhow::Result;
use serde::{Deserialize, Serialize};
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
#[derive(Debug, Serialize, Deserialize)]
pub struct Character {
    id: Uuid,
    display_name: String,
    first_name: Option<String>,
    last_name: Option<String>,
    description: Option<Uuid>,
    portrait_link: Option<Uuid>,
    artwork_link: Option<Uuid>,
    background_link: Option<Uuid>,
}

/// CharacterForm represents the form a user can fill
/// to create a new user
#[derive(TS)]
#[ts(export, export_to = "../../src/bindings/")]
#[derive(Debug, Serialize, Deserialize)]
pub struct CharacterForm {
    display_name: String,
    first_name: Option<String>,
    last_name: Option<String>,
    description: Option<String>,
}

impl Character {
    pub fn new(display_name: &str) -> Result<Self> {
        Character::validate_name(display_name)?;
        Ok(Character {
            id: Uuid::new_v4(),
            display_name: String::from(display_name),
            first_name: None,
            last_name: None,
            description: None,
            portrait_link: None,
            artwork_link: None,
            background_link: None,
        })
    }

    pub fn get_id(&self) -> &Uuid {
        &self.id
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
        return &self.display_name;
    }

    pub fn get_file_name(&self) -> String {
        self.id.simple().to_string()[..16].to_string()
    }

    fn validate_name(name: &str) -> Result<()> {
        use anyhow::bail;

        let trimmed = name.trim();

        if trimmed.is_empty() {
            bail!("Character name cannot be empty");
        }

        if trimmed != name {
            bail!("Character name cannot have leading or trailing whitespace");
        }

        // Path traversal and separators
        if name.contains('/') || name.contains('\\') {
            bail!("Character name cannot contain path separators");
        }

        if name == "." || name == ".." || name.contains("..") {
            bail!("Character name cannot contain path traversal sequences");
        }

        // Null byte injection
        if name.contains('\0') {
            bail!("Character name cannot contain null bytes");
        }

        // Windows-reserved characters (safe cross-platform)
        const RESERVED: &[char] = &['<', '>', ':', '"', '|', '?', '*'];
        if name.chars().any(|c| RESERVED.contains(&c)) {
            bail!("Character name contains reserved characters: < > : \" | ? *");
        }

        // Control characters
        if name.chars().any(|c| c.is_control()) {
            bail!("Character name cannot contain control characters");
        }

        // Reasonable length limit (filesystem + UUID suffix in get_file_name)
        if name.len() > 200 {
            bail!("Character name cannot exceed 200 characters");
        }

        Ok(())
    }

}
