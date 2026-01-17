use std::path::Path;
use std::fs;

use anyhow::Result;
use uuid::Uuid;


/// Allows for uploads and retreiving of
/// assets for the project.
/// Those assets can be stored both on the 
/// git repository or on a remote server depending
/// on the version of the application.
pub trait Uploader {
    fn updload(&self, from_path:String, project_path: &Path) -> Result<Uuid> {
        let uuid = Uuid::new_v4();
        let to_path = project_path.join("assets/").join(uuid.to_string());
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
