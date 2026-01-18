use std::fs;
use std::path::Path;
use std::sync::{Arc, Mutex, MutexGuard, RwLock};

use anyhow::{anyhow, Result};
use uuid::Uuid;

/// Allows for uploads and retreiving of
/// assets for the project.
/// Those assets can be stored both on the
/// git repository or on a remote server depending
/// on the version of the application.
pub trait Uploader: Send + Sync {
    fn updload(&self, from_path: &str, project_path: &Path) -> Result<Uuid> {
        let uuid = Uuid::new_v4();
        let to_path = project_path.join("assets").join(uuid.to_string());
        fs::copy(from_path, to_path).expect("Could not copy the file to the repository");
        Ok(uuid)
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
