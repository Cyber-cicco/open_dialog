use std::fs;
use std::path::{Path, PathBuf};
use std::sync::{Arc, Mutex, MutexGuard};

use anyhow::{anyhow, Context, Result};
use uuid::Uuid;

/// Allows for uploads and retreiving of
/// assets for the project.
/// Those assets can be stored both on the
/// git repository or on a remote server depending
/// on the version of the application.
pub trait Uploader: Send + Sync {
    fn updload(&self, from: &str, project_path: &Path) -> Result<String> {
        let uuid = Uuid::new_v4();
        let from_path = PathBuf::from(&from);
        let extension = from_path
            .extension()
            .context("no extension")
            .map(|e| e.to_str())
            .context("no extension")?
            .context("no extension")?;
        let name = format!("{}.{}", uuid.to_string(), extension);
        let to_path = project_path.join("assets").join(&name);
        fs::copy(from_path, to_path).context("Could not copy the file to the repository")?;
        Ok(name)
    }
}

pub trait Persisted<T> {
    fn shallow_load(project_path: &Path) -> Result<T>;
    fn deep_load(project_path: &Path) -> Result<T>;
    fn save(&self) -> Result<()>;
}

pub struct FSUploader {}

impl Uploader for FSUploader {}

pub struct Shared<T>(Arc<Mutex<T>>);
impl<T> Shared<T> {
    pub fn new(value: T) -> Self {
        Self(Arc::new(Mutex::new(value)))
    }

    pub fn lock(&self) -> Result<MutexGuard<'_, T>> {
        self.0.lock().map_err(|e| anyhow!("lock error: {e}"))
    }
}

impl<T> Clone for Shared<T> {
    fn clone(&self) -> Self {
        Self(Arc::clone(&self.0))
    }
}

#[enum_dispatch::enum_dispatch]
pub trait Identified {
    fn get_id(&self) -> &Uuid;
}
