output "web_app_api_key" {
  type      = string
  sensitive = true
  value     = azurerm_static_web_app.main.api_key
}
