data_dir = "/home/itacirgabral/source/gmapi/consul.data"
datacenter = "gmapi"
log_level = "INFO"
node_name = "clientatend"
encrypt = "cgnLq0f0QfSNm8x+t2P1CzXHG037y8caIrWQmEChPug="
server     = false
retry_join = ["lenovo"]
service {
  id      = "dns"
  name    = "dns"
  tags    = ["primary"]
  address = "localhost"
  port    = 8600
  check {
    id       = "dns"
    name     = "Consul DNS TCP on port 8600"
    tcp      = "localhost:8600"
    interval = "10s"
    timeout  = "1s"
  }
}