use crate::shared::{config::ODConfig, types::interfaces::Shared};

pub struct FileDialogDao<C:ODConfig> {
    config: Shared<C>,
}

pub trait DialogDao<C:ODConfig> { }

impl<C:ODConfig> FileDialogDao<C> {
    pub fn new(config:Shared<C>) -> Self {
        FileDialogDao { config }
    }
}

impl<C:ODConfig> DialogDao<C> for FileDialogDao<C> {

}
