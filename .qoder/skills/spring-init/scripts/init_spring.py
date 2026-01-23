#!/usr/bin/env python3
"""
Spring Boot Project Initializer

Creates a new Spring Boot project using Spring Initializr API.
"""

import argparse
import os
import subprocess
import sys
import tempfile
import urllib.request
import urllib.parse
import zipfile


def parse_args():
    parser = argparse.ArgumentParser(description="Initialize a Spring Boot project")
    parser.add_argument("--name", default="demo", help="Project name (default: demo)")
    parser.add_argument("--group", default="com.example", help="Group ID (default: com.example)")
    parser.add_argument("--artifact", default="demo", help="Artifact ID (default: demo)")
    parser.add_argument("--java", default="17", help="Java version (default: 17)")
    parser.add_argument("--boot-version", default=None, help="Spring Boot version (default: latest stable)")
    parser.add_argument("--dependencies", default="web", help="Comma-separated dependencies (default: web)")
    parser.add_argument("--output-dir", required=True, help="Output directory for the project")
    return parser.parse_args()


def download_project(args):
    """Download project from Spring Initializr."""
    params = {
        "type": "maven-project",
        "language": "java",
        "groupId": args.group,
        "artifactId": args.artifact,
        "name": args.name,
        "javaVersion": args.java,
        "dependencies": args.dependencies,
    }
    
    # Only add bootVersion if explicitly specified
    if args.boot_version:
        params["bootVersion"] = args.boot_version
    
    base_url = "https://start.spring.io/starter.zip"
    query_string = urllib.parse.urlencode(params)
    url = f"{base_url}?{query_string}"
    
    print(f"Downloading from Spring Initializr...")
    print(f"URL: {url}")
    
    with tempfile.NamedTemporaryFile(suffix=".zip", delete=False) as tmp:
        try:
            urllib.request.urlretrieve(url, tmp.name)
            return tmp.name
        except Exception as e:
            print(f"Error downloading project: {e}", file=sys.stderr)
            sys.exit(1)


def extract_project(zip_path, output_dir, project_name):
    """Extract the project to the output directory."""
    project_path = os.path.join(output_dir, project_name)
    
    if os.path.exists(project_path):
        print(f"Error: Directory '{project_path}' already exists", file=sys.stderr)
        sys.exit(1)
    
    os.makedirs(project_path, exist_ok=True)
    
    print(f"Extracting to {project_path}...")
    
    with zipfile.ZipFile(zip_path, 'r') as zip_ref:
        zip_ref.extractall(project_path)
    
    # Clean up
    os.unlink(zip_path)
    
    return project_path


def make_mvnw_executable(project_path):
    """Make Maven wrapper executable on Unix systems."""
    mvnw_path = os.path.join(project_path, "mvnw")
    if os.path.exists(mvnw_path):
        os.chmod(mvnw_path, 0o755)
        print("Made mvnw executable")


def main():
    args = parse_args()
    
    print(f"Creating Spring Boot project: {args.name}")
    print(f"  Group ID: {args.group}")
    print(f"  Artifact ID: {args.artifact}")
    print(f"  Java Version: {args.java}")
    print(f"  Spring Boot: {args.boot_version or 'latest stable'}")
    print(f"  Dependencies: {args.dependencies}")
    print()
    
    # Download project
    zip_path = download_project(args)
    
    # Extract project
    project_path = extract_project(zip_path, args.output_dir, args.name)
    
    # Make mvnw executable
    make_mvnw_executable(project_path)
    
    print()
    print("=" * 50)
    print(f"Project created successfully at: {project_path}")
    print("=" * 50)
    print()
    print("Next steps:")
    print(f"  cd {project_path}")
    print("  ./mvnw spring-boot:run")
    print()
    print("Build: ./mvnw clean package")
    print("Test:  ./mvnw test")


if __name__ == "__main__":
    main()
