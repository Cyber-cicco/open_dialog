use crate::shared::{config::ODConfig, types::interfaces::Shared};

pub struct FileMetaDao<C: ODConfig>{
    config: Shared<C>
}

pub trait MetaDao<C:ODConfig> {
    fn get_var_to_phylum_map(&self, project_id:&str);
}

impl<C:ODConfig> MetaDao<C> for FileMetaDao<C> {

    fn get_var_to_phylum_map(&self, project_id:&str) {

    }
}
