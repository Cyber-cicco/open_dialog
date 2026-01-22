use crate::shared::{config::ODConfig, types::interfaces::Shared};

pub struct FileVariableDao<C: ODConfig> {
    config: Shared<C>
}

pub trait VariableDao<C:ODConfig> {

}
