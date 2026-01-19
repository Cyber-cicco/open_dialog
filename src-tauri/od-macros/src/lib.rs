use proc_macro::TokenStream;
use quote::quote;
use syn::{parse_macro_input, ItemFn, FnArg, ReturnType, Pat};

/// Usage:
/// ```
/// #[tauri_command(character_service)]
/// pub fn create_character(project_id: &str, name: &str) -> Result<Character>;
/// ```
/// 
/// Expands to the full tauri::command with State injection and error mapping.
#[proc_macro_attribute]
pub fn tauri_command(attr: TokenStream, item: TokenStream) -> TokenStream {
    let service_name = parse_macro_input!(attr as syn::Ident);
    let input = parse_macro_input!(item as ItemFn);
    
    let fn_name = &input.sig.ident;
    let vis = &input.vis;
    
    // Extract args (excluding state which we'll inject)
    let args: Vec<_> = input.sig.inputs.iter().collect();
    let arg_names: Vec<_> = args.iter().filter_map(|arg| {
        if let FnArg::Typed(pat_type) = arg {
            if let Pat::Ident(ident) = &*pat_type.pat {
                return Some(&ident.ident);
            }
        }
        None
    }).collect();
    
    // Extract return type (unwrap Result<T, _> to get T)
    let return_type = match &input.sig.output {
        ReturnType::Type(_, ty) => quote!(#ty),
        ReturnType::Default => quote!(()),
    };
    
    let expanded = quote! {
        #[tauri::command]
        #vis fn #fn_name<'a>(
            #(#args,)*
            state: tauri::State<'a, crate::shared::state::AppState>,
        ) -> Result<#return_type, String> {
            state.#service_name.#fn_name(#(#arg_names),*)
                .map_err(|e| e.to_string())
        }
    };
    
    expanded.into()
}
