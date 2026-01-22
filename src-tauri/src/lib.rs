mod factory;
mod pkg;
mod shared;

use crate::factory::init_local_app_state;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let app_state = init_local_app_state().expect("Failed to initialize app state");

    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .manage(app_state)
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![

            pkg::project::create_project,
            pkg::project::get_projects,

            pkg::character::create_character,
            pkg::character::change_character,
            pkg::character::upload_image,
            pkg::character::get_all_characters,

            pkg::dialog::create_dialog,
            pkg::dialog::get_dialog_by_id,
            pkg::dialog::get_dialog_metadata,
            pkg::dialog::save_dialog,
            pkg::dialog::save_dialog_content,

            pkg::variables::load_variables,
            pkg::variables::persist_variables,

        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
