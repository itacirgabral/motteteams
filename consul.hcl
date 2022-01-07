data_dir = "/usr/opt/consul"

datacenter = "gmapi"
node_name = "lenovo"

encrypt = "cgnLq0f0QfSNm8x+t2P1CzXHG037y8caIrWQmEChPug="

auto_encrypt {
  allow_tls = true
}

ui_config {
  enabled = true
}

server = true
bootstrap_expect = 1

bind_addr = "192.168.0.54"