#!/bin/bash

echo settting volume to $1%
amixer  sset PCM,0 $1%
