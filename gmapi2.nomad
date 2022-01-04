job "gmapi" {
  datacenters = ["dc1"]
  type = "service"
  update {
    max_parallel = 1
    min_healthy_time = "10s"
    healthy_deadline = "3m"
    progress_deadline = "10m"
    auto_revert = false
    canary = 0
  }
  migrate {
    max_parallel = 1
    health_check = "checks"
    min_healthy_time = "10s"
    healthy_deadline = "5m"
  }
  group "am6" {
    count = 1
    network {
      port "redisport" {
        to = 6379
      }
      port "restport" {
        to = 3000
      }
    }

    service {
      name = "redis"
      tags = ["gmapi"]
      port = "redisport"
    }

    restart {
      attempts = 2
      interval = "30m"
      delay = "15s"
      mode = "fail"
    }

    task "redis" {
      driver = "docker"
      config {
        image = "redislabs/redismod"
        volumes = [
            "redisdata:/data"
        ]
        ports = ["redisport"]
      }
      resources {
        cpu    = 500 # 500 MHz
        memory = 256 # 256MB
      }
    }
  }
}
