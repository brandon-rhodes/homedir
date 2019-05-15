#!/bin/bash

echo 'DestroyMenu Pastes'
echo 'AddToMenu Pastes "Pastes" Title'
for path in ~/.fvwm/pastes/*
do
    name="$(basename $path)"
    letter="${name:0:1}"
    echo '+ "&'"$letter"'. '"$name"'" Exec xclip -selection clipboard '"$path"' && xclip -selection primary '"$path"
done
cat <<'EOF'
+ "&Markdown" Exec xclip -out -selection clipboard | pandoc | xclip -selection clipboard -target text/html
+ DynamicPopUpAction PipeRead .fvwm/paste-menu.sh
EOF
