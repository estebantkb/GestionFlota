# 🧪 Guía de Pruebas TDD - Sistema de Gestión de Flotas

## 📋 Estructura de Pruebas Creadas

```
src/test/java/uce/edu/GestionFlota/
├── Controller/
│   └── VehicleControllerTest.java    (Pruebas de API REST)
├── Service/
│   └── VehicleServiceTest.java       (Pruebas de lógica de negocio)
└── Repository/
    └── VehicleRepositoryTest.java    (Pruebas de base de datos)
```

## 🎯 Tipos de Pruebas

### 1️⃣ **Pruebas Unitarias** (Service Layer)
- **Archivo**: `VehicleServiceTest.java`
- **Anotación**: `@Mock`, `@InjectMocks`
- **Propósito**: Probar lógica de negocio aislada
- **Velocidad**: ⚡ Muy rápidas (sin BD)

### 2️⃣ **Pruebas de Integración** (Repository Layer)
- **Archivo**: `VehicleRepositoryTest.java`
- **Anotación**: `@DataJpaTest`
- **Propósito**: Probar consultas SQL con BD en memoria
- **Velocidad**: 🚀 Rápidas (H2 in-memory)

### 3️⃣ **Pruebas de API** (Controller Layer)
- **Archivo**: `VehicleControllerTest.java`
- **Anotación**: `@WebMvcTest`
- **Propósito**: Probar endpoints REST
- **Velocidad**: ⚡ Rápidas (sin servidor completo)

## 🚀 Cómo Ejecutar las Pruebas

### Opción 1: Desde la Terminal
```bash
# Ejecutar TODAS las pruebas
mvn test

# Ejecutar solo una clase específica
mvn test -Dtest=VehicleServiceTest

# Ejecutar con reporte de cobertura
mvn test jacoco:report
```

### Opción 2: Desde IntelliJ IDEA
1. Click derecho en la clase de prueba
2. Seleccionar "Run 'VehicleServiceTest'"
3. Ver resultados en la ventana de pruebas

### Opción 3: Desde VS Code
1. Instalar extensión "Test Runner for Java"
2. Click en el ícono de pruebas (🧪) en la barra lateral
3. Ejecutar pruebas individuales o todas

## 📊 Ejemplos de Pruebas Incluidas

### ✅ VehicleServiceTest (10 pruebas)
- ✓ Obtener todos los vehículos
- ✓ Buscar vehículo por placa (existe)
- ✓ Buscar vehículo por placa (no existe)
- ✓ Guardar vehículo nuevo
- ✓ Eliminar vehículo con mantenimientos
- ✓ Verificar existencia por ID
- ✓ Valores por defecto correctos

### ✅ VehicleRepositoryTest (6 pruebas)
- ✓ Encontrar por placa (existe)
- ✓ Encontrar por placa (no existe)
- ✓ Guardar vehículo
- ✓ Actualizar vehículo
- ✓ Eliminar vehículo
- ✓ Restricción de placa única

### ✅ VehicleControllerTest (8 pruebas)
- ✓ GET /api/vehicles (lista completa)
- ✓ GET /api/vehicles/plate/{plate} (encontrado)
- ✓ GET /api/vehicles/plate/{plate} (404)
- ✓ POST /api/vehicles (crear)
- ✓ PUT /api/vehicles (actualizar)
- ✓ DELETE /api/vehicles/{id}
- ✓ Validación de campos requeridos

## 🔄 Ciclo TDD Recomendado

```
1. 🔴 RED   → Escribe la prueba (falla)
2. 🟢 GREEN → Escribe código mínimo (pasa)
3. 🔵 REFACTOR → Mejora el código
```

### Ejemplo Práctico:

**Paso 1 - RED**: Escribir prueba que falla
```java
@Test
void testCalcularProximoMantenimiento() {
    Vehicle v = new Vehicle();
    v.setMileage(10000.0);
    v.setLastMaintenanceKm(5000.0);
    v.setMaintenanceIntervalKm(5000);
    
    assertEquals(10000.0, calcularProximo(v));
}
```

**Paso 2 - GREEN**: Implementar código
```java
public Double calcularProximo(Vehicle v) {
    return v.getLastMaintenanceKm() + v.getMaintenanceIntervalKm();
}
```

**Paso 3 - REFACTOR**: Optimizar si es necesario

## 📈 Próximos Pasos

Para expandir las pruebas TDD, puedes crear:

1. **MaintenanceServiceTest.java** - Lógica de mantenimientos
2. **MaintenanceRepositoryTest.java** - Consultas de mantenimientos
3. **MaintenanceControllerTest.java** - API de mantenimientos
4. **Pruebas de integración completas** - Flujos end-to-end

## 🛠️ Dependencias Necesarias

Las siguientes dependencias ya están incluidas en Spring Boot:

```xml
<!-- JUnit 5 -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-test</artifactId>
    <scope>test</scope>
</dependency>

<!-- Mockito (incluido en spring-boot-starter-test) -->
<!-- H2 Database para pruebas -->
<dependency>
    <groupId>com.h2database</groupId>
    <artifactId>h2</artifactId>
    <scope>test</scope>
</dependency>
```

## 📚 Recursos Adicionales

- [JUnit 5 Documentation](https://junit.org/junit5/docs/current/user-guide/)
- [Mockito Documentation](https://javadoc.io/doc/org.mockito/mockito-core/latest/org/mockito/Mockito.html)
- [Spring Boot Testing](https://spring.io/guides/gs/testing-web/)

## ✨ Buenas Prácticas

1. ✅ **Nombres descriptivos**: `testGetByLicensePlate_Success`
2. ✅ **Patrón AAA**: Arrange, Act, Assert
3. ✅ **Una aserción por concepto**: Enfoca cada prueba
4. ✅ **Independencia**: Cada prueba debe correr sola
5. ✅ **Cobertura**: Apunta a >80% de cobertura de código
6. ✅ **Velocidad**: Las pruebas deben ser rápidas (<1 segundo)

---

**¡Feliz Testing!** 🎉
