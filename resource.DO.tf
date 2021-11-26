resource "digitalocean_droplet" "gmapi2" {
  image    = "ubuntu-18-04-x64"
  name     = "GMPAI2"
  region   = "nyc3"
  size     = "s-1vcpu-1gb-amd"
  ssh_keys = [
    data.digitalocean_ssh_key.terraform.id
  ]
}

connection {
    host = self.ipv4_address
    user = "root"
    type = "ssh"
    private_key = file(var.pvt_key)
    timeout = "2m"
  }

output "droplet_ip_addresses" {
  value = {
    for droplet in digitalocean_droplet.gmapi2:
    droplet.name => droplet.ipv4_address
  }
}

provisioner "remote-exec" {
    inline = "sudo apt update"
  }

provisioner "local-exec" {
  command = "ANSIBLE_HOST_KEY_CHECKING=False ansible-playbook -u {var.user} -i '${self.ipv4_address},' --private-key ${var.ssh_private_key} playbook.yml"
}