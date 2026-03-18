{{/*
Expand the name of the chart.
*/}}
{{- define "kk-flv.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Create a default fully qualified app name.
*/}}
{{- define "kk-flv.fullname" -}}
{{- if .Values.fullnameOverride }}
{{- .Values.fullnameOverride | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- $name := default .Chart.Name .Values.nameOverride }}
{{- printf "%s-%s" .Release.Name $name | trunc 63 | trimSuffix "-" }}
{{- end }}
{{- end }}

{{/*
Backend fullname.
*/}}
{{- define "kk-flv.backend.fullname" -}}
{{- printf "%s-backend" .Release.Name | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Frontend fullname.
*/}}
{{- define "kk-flv.frontend.fullname" -}}
{{- printf "%s-frontend" .Release.Name | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Backend image.
*/}}
{{- define "kk-flv.backend.image" -}}
{{- $registry := default .Values.global.imageRegistry .Values.backend.image.registry }}
{{- $tag := default .Chart.AppVersion .Values.backend.image.tag }}
{{- printf "%s/%s:%s" $registry .Values.backend.image.repository $tag }}
{{- end }}

{{/*
Frontend image.
*/}}
{{- define "kk-flv.frontend.image" -}}
{{- $registry := default .Values.global.imageRegistry .Values.frontend.image.registry }}
{{- $tag := default .Chart.AppVersion .Values.frontend.image.tag }}
{{- printf "%s/%s:%s" $registry .Values.frontend.image.repository $tag }}
{{- end }}
