#!/bin/bash

# CR3 Cleanup Script
# Identifies .CR3 files without matching .JPG files and optionally deletes them
# Usage: ./scripts/cleanup-cr3.sh

set -e  # Exit on any error

# Function to display script usage
show_usage() {
    echo "CR3 Cleanup Script"
    echo "This script finds .CR3 files without matching .JPG files in a specified folder"
    echo "and optionally deletes them after user confirmation."
    echo ""
}

# Function to validate if directory exists and is accessible
validate_directory() {
    local dir="$1"
    
    if [[ ! -d "$dir" ]]; then
        echo "Error: Directory '$dir' does not exist."
        return 1
    fi
    
    if [[ ! -r "$dir" ]]; then
        echo "Error: Directory '$dir' is not readable."
        return 1
    fi
    
    return 0
}

# Function to find orphaned CR3 files
find_orphaned_cr3_files() {
    local target_dir="$1"
    local orphaned_files=()
    
    # Find all .CR3 files in the directory (non-recursive)
    while IFS= read -r -d '' cr3_file; do
        # Extract filename without extension
        local basename=$(basename "$cr3_file" .CR3)
        local dirname=$(dirname "$cr3_file")
        
        # Check if corresponding .JPG file exists (exact filename match)
        local jpg_file="$dirname/$basename.JPG"
        
        if [[ ! -f "$jpg_file" ]]; then
            orphaned_files+=("$cr3_file")
        fi
    done < <(find "$target_dir" -maxdepth 1 -name "*.CR3" -type f -print0 2>/dev/null)
    
    # Return the array of orphaned files
    printf '%s\n' "${orphaned_files[@]}"
}

# Function to get user confirmation
get_user_confirmation() {
    local response
    echo -n "Delete these files? (y/yes): "
    read -r response
    
    case "$response" in
        [Yy]|[Yy][Ee][Ss])
            return 0
            ;;
        *)
            return 1
            ;;
    esac
}

# Function to delete files
delete_files() {
    local files=("$@")
    local deleted_count=0
    local failed_count=0
    
    for file in "${files[@]}"; do
        if rm "$file" 2>/dev/null; then
            echo "Deleted: $file"
            ((deleted_count++))
        else
            echo "Failed to delete: $file"
            ((failed_count++))
        fi
    done
    
    echo ""
    echo "Deletion complete:"
    echo "  Successfully deleted: $deleted_count files"
    if [[ $failed_count -gt 0 ]]; then
        echo "  Failed to delete: $failed_count files"
    fi
}

# Main script execution
main() {
    show_usage
    
    # Prompt user for directory path
    echo -n "Enter folder path: "
    read -r target_directory
    
    # Expand tilde to home directory if present
    target_directory="${target_directory/#\~/$HOME}"
    
    # Validate the directory
    if ! validate_directory "$target_directory"; then
        exit 1
    fi
    
    echo ""
    echo "Scanning directory: $target_directory"
    echo "Looking for .CR3 files without matching .JPG files..."
    echo ""
    
    # Find orphaned CR3 files
    orphaned_files=()
    while IFS= read -r line; do
        [[ -n "$line" ]] && orphaned_files+=("$line")
    done < <(find_orphaned_cr3_files "$target_directory")
    
    # Check if any orphaned files were found
    if [[ ${#orphaned_files[@]} -eq 0 ]]; then
        echo "No orphaned .CR3 files found."
        echo "All .CR3 files have matching .JPG files."
        exit 0
    fi
    
    # Display found orphaned files
    echo "Found ${#orphaned_files[@]} orphaned .CR3 file(s):"
    echo ""
    for file in "${orphaned_files[@]}"; do
        echo "  - $(basename "$file")"
    done
    echo ""
    
    # Get user confirmation for deletion
    if get_user_confirmation; then
        echo ""
        echo "Deleting orphaned .CR3 files..."
        delete_files "${orphaned_files[@]}"
    else
        echo ""
        echo "Deletion cancelled. No files were deleted."
    fi
}

# Run the main function
main "$@"
