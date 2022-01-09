#!/bin/sh

nomad agent -dev -dc=gestormessenger -bind=0.0.0.0 -config-dir=./nomad.d