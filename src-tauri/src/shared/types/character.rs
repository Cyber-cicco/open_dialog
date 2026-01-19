use std::path::Path;
use std::sync::Arc;

use anyhow::Result;
use serde::{Deserialize, Serialize};
use tauri::http::header::RETRY_AFTER;
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
    description: Option<String>,
    description_link: Option<Uuid>,
    portrait_link: Option<String>,
    artwork_link: Option<String>,
    background_link: Option<String>,
}

/// CharacterForm represents the form a user can fill
/// to create a new user
#[derive(TS)]
#[ts(export, export_to = "../../src/bindings/")]
#[derive(Debug, Serialize, Deserialize)]
pub struct CharacterForm<'a> {
    pub id: &'a str,
    pub display_name: String,
    pub first_name: Option<String>,
    pub last_name: Option<String>,
    pub description: Option<String>,
}

#[derive(TS)]
#[ts(export, export_to = "../../src/bindings/")]
#[derive(Serialize, Deserialize, Debug, Clone, Copy)]
pub enum ImageField {
    Portrait,
    Artwork,
    Background,
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
            description_link: None,
            portrait_link: None,
            artwork_link: None,
            background_link: None,
        })
    }

    pub fn get_id(&self) -> &Uuid {
        &self.id
    }

    pub fn upload_image(
        &mut self,
        from: &str,
        project_path: &Path,
        uploader: Arc<dyn Uploader>,
        field: ImageField,
    ) -> Result<()> {
        let name = uploader.updload(from, project_path)?;
        match field {
            ImageField::Artwork => self.artwork_link = Some(name),
            ImageField::Portrait => self.portrait_link = Some(name),
            ImageField::Background => self.background_link = Some(name),
        };
        Ok(())
    }

    pub fn set_description_link(&mut self, description: Uuid) {
        self.description_link = Some(description);
    }

    pub fn get_description_link(&self) -> Option<Uuid> {
        return self.description_link;
    }

    pub fn set_description(&mut self, description: &str) {
        self.description = Some(String::from(description))
    }

    pub fn get_name(&self) -> &String {
        return &self.display_name
    }

    pub fn validate_name(name: &str) -> Result<()> {
        use anyhow::bail;

        let trimmed = name.trim();

        if trimmed.is_empty() {
            bail!("Character name cannot be empty");
        }

        if trimmed != name {
            bail!("Character name cannot have leading or trailing whitespace");
        }

        if name.contains('/') || name.contains('\\') {
            bail!("Character name cannot contain path separators");
        }

        if name == "." || name == ".." || name.contains("..") {
            bail!("Character name cannot contain path traversal sequences");
        }

        if name.contains('\0') {
            bail!("Character name cannot contain null bytes");
        }

        const RESERVED: &[char] = &['<', '>', ':', '"', '|', '?', '*'];
        if name.chars().any(|c| RESERVED.contains(&c)) {
            bail!("Character name contains reserved characters: < > : \" | ? *");
        }

        if name.chars().any(|c| c.is_control()) {
            bail!("Character name cannot contain control characters");
        }

        if name.len() > 200 {
            bail!("Character name cannot exceed 200 characters");
        }

        Ok(())
    }

    pub fn change_from_form(&mut self, char_form: &CharacterForm) {
        self.last_name = char_form.last_name.clone();
        self.display_name = char_form.display_name.clone();
        self.first_name = char_form.first_name.clone();
    }
}
