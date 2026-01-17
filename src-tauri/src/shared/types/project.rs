use std::{path::{Path, PathBuf}, sync::{Arc, RwLock}};

use chrono::prelude::*;
use serde::{Deserialize, Serialize};
use ts_rs::TS;
use uuid::Uuid;

#[derive(TS)]
#[ts(export, export_to = "../../src/bindings/")]
#[derive(Debug, Serialize, Deserialize)]
pub struct Project {
    id: Uuid,
    name: String,
    path:PathBuf,
    metadata: ProjectMetadata,
}

#[derive(TS)]
#[ts(export, export_to = "../../src/bindings/")]
#[derive(Debug, Serialize, Deserialize)]
pub struct ProjectMetadata {
    created_at: DateTime<Utc>,
    last_commit: Option<DateTime<Utc>>,
    current_branch: Option<String>,
    branches: Vec<String>,
}

pub type AtomicProject = Arc<RwLock<Project>>;
pub type AtomicProjects = Arc<RwLock<Vec<AtomicProject>>>;

impl Project {

    pub fn new(name: &str, root_path:&PathBuf) -> Self {
        let created_at = Utc::now();
        let id = Uuid::new_v4();
        let path = root_path.join(&id.simple().to_string()[..12]);
        let name = String::from(name);
        let metadata = ProjectMetadata{
            created_at,
            last_commit:None,
            current_branch:None,
            branches:vec![],
        };
        return Self {
            path,
            id,
            name,
            metadata,
        };
    }

    pub fn get_id(&self) -> &Uuid {
        &self.id
    }

    pub fn set_last_commit(&mut self, date:DateTime<Utc>) {
        self.metadata.last_commit = Some(date);
    }

    pub fn set_current_branch(&mut self, branch: &str) {
        self.metadata.current_branch = Some(String::from(branch));
    }

    pub fn append_branch_and_checkout(&mut self, branch: &str) {
        self.append_branch(branch);
        self.set_current_branch(branch);
    }

    pub fn append_branch(&mut self, branch: &str) {
        self.metadata.branches.push(String::from(branch));
    }

    pub fn get_path(&self) -> &Path {
        return &self.path
    }

}
