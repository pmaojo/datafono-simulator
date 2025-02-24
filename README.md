# 🏧 Simulador de Datáfono Comercia Global Payments

<div align="center">

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg?style=for-the-badge)
![License](https://img.shields.io/badge/license-MIT-green.svg?style=for-the-badge)
![Node](https://img.shields.io/badge/node-%3E%3D%2016.0.0-brightgreen.svg?style=for-the-badge)
![TypeScript](https://img.shields.io/badge/typescript-%5E5.0.0-blue.svg?style=for-the-badge)

</div>

<p align="center">
  <img src="https://raw.githubusercontent.com/othneildrew/Best-README-Template/master/images/logo.png" alt="Logo" width="200" height="200">
</p>

## 📋 Tabla de Contenidos

- [Sobre el Proyecto](#-sobre-el-proyecto)
- [Características](#-características)
- [Tecnologías](#-tecnologías)
- [Empezando](#-empezando)
  - [Prerrequisitos](#prerrequisitos)
  - [Instalación](#instalación)
- [Uso](#-uso)
- [API Reference](#-api-reference)
- [Contribuir](#-contribuir)
- [Licencia](#-licencia)
- [Contacto](#-contacto)

## 🎯 Sobre el Proyecto

El Simulador de Datáfono es una herramienta de desarrollo que emula el comportamiento de los terminales de pago Comercia Global Payments. Diseñado para facilitar el desarrollo y pruebas de integración de aplicaciones de pago, proporciona una experiencia realista del proceso de transacción sin necesidad de hardware físico.

## ✨ Características

- 🔄 Simulación realista de transacciones de pago
- ⚡ Tiempos de respuesta variables basados en el tipo de conexión (WIFI/CABLE)
- 🔒 Autenticación mediante headers X-SOURCE
- 💾 Persistencia de transacciones
- 📊 Monitorización del estado de transacciones
- 🎲 Simulación de escenarios de éxito/error (90/10)

## 🛠 Tecnologías

- [Next.js 13](https://nextjs.org/)
- [TypeScript](https://www.typescriptlang.org/)
- [Node.js](https://nodejs.org/)

## 🚀 Empezando

### Prerrequisitos

- Node.js >= 16.0.0
- npm >= 7.0.0

### Instalación

1. Clona el repositorio

```bash
git clone https://github.com/tu-usuario/simulador-datafono.git
```

2. Instala las dependencias

```bash
cd simulador-datafono
npm install
```

3. Inicia el servidor de desarrollo

```bash
npm run dev
```

## 📖 Uso

### Script de Prueba

El proyecto incluye un script de prueba para simular transacciones:

```bash
./test_payment_v2.sh
```

### Ejemplo de Integración

```typescript
const response = await fetch('http://localhost:3002/v1/transactions/payment', {
  method: 'POST',
  headers: {
    'X-SOURCE': 'COMERCIA',
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    orderId: 'tx-00000001',
    amount: 10.5,
    description: 'Test Payment',
  }),
});
```

## 📚 API Reference

### Endpoints

#### Iniciar Pago

```http
POST /v1/transactions/payment
```

#### Consultar Estado

```http
POST /v1/transactions/status
```

### Códigos de Respuesta

| Código | Descripción              |
| ------ | ------------------------ |
| 0      | Success                  |
| 1001   | Service is busy          |
| 1010   | EMV Initialization Error |

[Ver documentación completa de códigos →](./docs/response-codes.md)

## 🤝 Contribuir

Las contribuciones son bienvenidas. Para cambios importantes:

1. Fork el proyecto
2. Crea tu rama de características (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add: Amazing Feature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Distribuido bajo la Licencia MIT. Ver `LICENSE` para más información.

## 📫 Contacto

Tu Nombre - [@tu_twitter](https://twitter.com/tu_twitter) - email@example.com

Link del Proyecto: [https://github.com/tu-usuario/simulador-datafono](https://github.com/tu-usuario/simulador-datafono)

---
