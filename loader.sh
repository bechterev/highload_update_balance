#!/bin/bash

 while ! nc -z localhost 3000; do
  sleep 1
done

{ time seq 10000 | xargs -n 1 -P 10000 -I {} curl -X PUT http://localhost:3000/updateBalance/1/2
} 2> info.txt
