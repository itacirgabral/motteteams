project = "GMAPI2"

app "restapi" {
    build {
        use "pack" {}
    }

    deploy {
        use "docker" {}
    }
}
