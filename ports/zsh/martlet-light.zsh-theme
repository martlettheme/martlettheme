# Martlet Light Zsh prompt · 1.0.0
# Generated from src/palettes.mjs and src/zsh-theme.zsh. MIT licensed.
# Source this file at the end of ~/.zshrc, after any framework initialization.
# Match this variant to your terminal's Light or Dark background.
# No terminal background, font, key binding, or shell startup file is changed.

autoload -Uz add-zsh-hook
# Switching between these companion themes, or sourcing twice, keeps one hook.
add-zsh-hook -d precmd _martlet_precmd 2>/dev/null || true
add-zsh-hook -d precmd _krigsvold_precmd 2>/dev/null || true
setopt prompt_percent prompt_subst
unsetopt prompt_bang
typeset -g _martlet_color_accent='#154C9E'
typeset -g _martlet_color_secondary='#154C9E'
typeset -g _martlet_color_muted='#455B76'
typeset -g _martlet_color_git='#103A79'
typeset -g _martlet_color_danger='#A02E42'
typeset -g _martlet_color_success='#286B40'
typeset -g _martlet_color_warning='#805000'
# Native Terminal.app and other terminals without advertised truecolor use ANSI.
if [[ ${COLORTERM-} != (truecolor|24bit) && ${TERM-} != *-direct ]]; then
  _martlet_color_accent='4'
  _martlet_color_secondary='3'
  _martlet_color_muted='8'
  _martlet_color_git='4'
  _martlet_color_danger='1'
  _martlet_color_success='2'
  _martlet_color_warning='3'
fi

typeset -g _martlet_git='' _martlet_error='' _martlet_remote=''

_martlet_precmd() {
  local -i command_result=$?
  emulate -L zsh
  typeset -g _martlet_git='' _martlet_error='' _martlet_remote=''
  if (( command_result )); then
    _martlet_error="%F{${_martlet_color_danger}}exit ${command_result}%f "
  fi

  [[ ${MARTLET_GIT:-1} == 0 ]] && return 0
  (( $+commands[git] )) || return 0
  local report line branch='' xy flags='' escaped
  local -i staged=0 changed=0 untracked=0 conflicted=0
  # One read-only local status operation per prompt; no fetch or optional locks.
  report=$(LC_ALL=C GIT_OPTIONAL_LOCKS=0 command git -c core.quotepath=true status --porcelain=v1 --branch --untracked-files=normal 2>/dev/null) || return 0
  for line in "${(@f)report}"; do
    case "$line" in
      '## '*)
        branch=${line#'## '}
        branch=${branch%%...*}
        branch=${branch#'No commits yet on '}
        branch=${branch#'Initial commit on '}
        [[ $branch == 'HEAD (no branch)'* ]] && branch='detached'
        ;;
      '?? '*) (( untracked++ )) ;;
      '!! '*) ;;
      *)
        xy=${line[1,2]}
        if [[ $xy == (DD|AU|UD|UA|DU|AA|UU) ]]; then
          (( conflicted++ ))
        else
          [[ ${line[1]} != ' ' ]] && (( staged++ ))
          [[ ${line[2]} != ' ' ]] && (( changed++ ))
        fi
        ;;
    esac
  done
  [[ -n $branch ]] || return 0
  (( ${#branch} > 36 )) && branch="${branch[1,33]}..."
  # Branch names are data: escape prompt codes, and never evaluate their content.
  # PROMPT references this variable once; substitution results are not re-evaluated.
  escaped=${branch//\%/%%}
  (( staged )) && flags+=" %F{${_martlet_color_success}}+${staged}%f"
  (( changed )) && flags+=" %F{${_martlet_color_warning}}~${changed}%f"
  (( untracked )) && flags+=" %F{${_martlet_color_muted}}?${untracked}%f"
  (( conflicted )) && flags+=" %F{${_martlet_color_danger}}x${conflicted}%f"
  _martlet_git=" %F{${_martlet_color_muted}}[%f%F{${_martlet_color_git}}${escaped}%f${flags}%F{${_martlet_color_muted}}]%f"
  return 0
}

PROMPT='%F{${_martlet_color_muted}}%n@%m%f %F{${_martlet_color_accent}}%3~%f${_martlet_git}'$'
''${_martlet_error}%F{${_martlet_color_accent}}%(!.#.>)%f '
RPROMPT=''
add-zsh-hook precmd _martlet_precmd
_martlet_precmd
