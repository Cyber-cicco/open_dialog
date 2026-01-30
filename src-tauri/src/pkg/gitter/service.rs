use std::path::PathBuf;

use anyhow::{Context, Result};
use git2::Repository;
use uuid::Uuid;

use crate::{
    shared::{
        config::ODConfig,
        types::{
            gitter::{BranchInfo, CommitGraph, CommitInfo},
            interfaces::Shared,
        },
    },
};

pub struct GitService<C: ODConfig> {
    config: Shared<C>,
}

impl<C: ODConfig> GitService<C> {
    pub fn new(config: Shared<C>) -> Self {
        Self { config }
    }

    pub fn commit(&self, project_id: Uuid, message: &str) -> Result<()> {
        let repo = self.open_repository(&project_id)?;
        let sig = repo.signature()?;
        let tree_oid = repo.index()?.write_tree()?;
        let tree = repo.find_tree(tree_oid)?;
        let parent = repo.head()?.peel_to_commit()?;
        repo.commit(Some("HEAD"), &sig, &sig, message, &tree, &[&parent])?;
        Ok(())
    }

    pub fn get_logs(&self, project_id: Uuid) -> Result<CommitGraph> {
        let mut commits: Vec<CommitInfo> = vec![];
        let repo = self.open_repository(&project_id)?;
        let branches = self.get_branches(&repo)?;
        let mut rev_walk = repo.revwalk()?;
        for branch in &branches {
            if let Ok(oid) = git2::Oid::from_str(&branch.tip) {
                let _ = rev_walk.push(oid);
            }
        }

        rev_walk.set_sorting(git2::Sort::TOPOLOGICAL | git2::Sort::TIME)?;
        for oid in rev_walk.flatten() {
            let commit = repo.find_commit(oid)?;
            commits.push(CommitInfo {
                id: commit.id().to_string(),
                message: commit.message().map(String::from),
                author: commit.author().name().map(String::from),
                email: commit.author().email().map(String::from),
                timestamp: commit.time().seconds(),
                parents: commit.parents().map(|p| p.id().to_string()).collect(),
            });
        }

        let head = repo
            .head()
            .ok()
            .and_then(|h| h.target())
            .map(|oid| oid.to_string());

        Ok(CommitGraph::new(commits, head, branches))
    }

    fn get_branches(&self, repo: &Repository) -> Result<Vec<BranchInfo>> {
        let mut branches = vec![];
        for branch_result in repo.branches(Some(git2::BranchType::Local))? {
            let (branch, _) = branch_result?;
            if let Some(name) = branch.name()? {
                let tip = branch.get().peel_to_commit()?.id().to_string();
                branches.push(BranchInfo::new(name.to_string(), tip));
            }
        }
        Ok(branches)
    }

    fn open_repository(&self, project_id: &Uuid) -> Result<Repository> {
        let project_path = self.get_project_path(project_id)?;
        Repository::open(project_path).context("could not open Repository")
    }

    fn get_project_path(&self, project_id: &Uuid) -> Result<PathBuf> {
        let project_path = &project_id.simple().to_string()[..12];
        Ok(self.config.lock()?.get_root_dir().join(project_path))
    }

}
