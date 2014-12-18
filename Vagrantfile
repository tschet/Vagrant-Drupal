# -*- mode: ruby -*-
# vi: set ft=ruby :

Vagrant.configure("2") do |config|

  config.vm.box = "devbox"
  config.vm.network "private_network", ip: "192.168.33.10"
  config.vm.hostname = "build.box"
  config.vm.synced_folder ".", "/var/www", :mount_options => ["dmode=777", "fmode=666"]

    config.vm.provider "virtualbox" do |v|
        v.gui = false
        v.name = "BuildBox"
        end
    
end