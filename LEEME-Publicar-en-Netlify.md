# Publicar SIGRI en Netlify y activar la consulta de folios
Guía preparada el 23 de octubre de 2026.

## Qué contiene este paquete
- El diseño anterior, incluidas las órbitas de la portada y el barrido animado de «Nosotros».
- El formulario visual original, con validación y mensajes de error corregidos.
- El logo del pie en blanco sin recuadro, usando el logo local mediante CSS.
- Una función de Netlify que lee Airtable y solo entrega folio, etapa, tarea y avance; fecha/observación son opcionales.
- No incluye credenciales, datos de clientes ni resultados simulados.
- El favicon usa provisionalmente el logo disponible; falta sustituirlo por el icono blanco adjunto.
- Verificado: TypeScript, compilación de la web y 17 pruebas con respuestas controladas. No verificado: despliegue real en Netlify ni lectura real de Airtable. La conexión externa sigue bloqueada en el entorno de construcción.

## 1. Extraer los archivos
Extrae SIGRI-Netlify.zip. La carpeta SIGRI-Netlify contiene package.json, netlify.toml, src, public, lib, netlify y tests.
No uses el paquete SIGRI-Nueva-proyecto.zip de la propuesta descartada.
El archivo Vista-previa.html, fuera de la carpeta de código, permite revisar el diseño y sus animaciones; el formulario de esa vista no consulta datos reales.
Las animaciones se reducen si tu sistema tiene activada la preferencia de accesibilidad «reducir movimiento».

## 2. Preparar la tabla de Airtable
Abre tu base actual; no necesitas migrarla ni duplicarla.
La configuración anterior usa tabla Seguimiento y vista 01 DATOS DE LA EMPRESA.
Confirma que ambas existen y que la vista incluye los registros que podrán consultarse.
Comprueba estos nombres exactos de columna:
- Folio
- Etapa
- Tarea
- Porcentaje

Cada folio debe identificar un solo registro. La consulta distingue mayúsculas, minúsculas y ceros iniciales.
Para conservar ceros iniciales, utiliza un campo de texto para Folio.
No cambies de tipo un campo operativo sin revisar las automatizaciones que dependan de él; basta con utilizar el folio real que ya tenga cada registro.

Revisa el tipo de Porcentaje:
- Campo de tipo porcentaje o fórmula que entrega una fracción: configura AIRTABLE_PROGRESS_SCALE=fraction. 0.48 se interpreta como 48%.
- Campo numérico o fórmula que entrega un número entre 0 y 100: configura AIRTABLE_PROGRESS_SCALE=percent. 48 se interpreta como 48%.
- Si el valor entregado es texto como 48%, la función reconoce el signo.
Confirmar esta escala con un folio conocido evita mostrar 1% como 100% o marcar valores como no disponibles.
No necesitas hacer pública tu base ni crear un enlace público de Airtable.

## 3. Preparar el acceso de solo lectura
Puedes reutilizar tu token existente si lo tienes guardado y cuenta con los permisos adecuados.
Si necesitas uno nuevo:
1. Abre https://airtable.com/create/tokens
2. Selecciona Create token.
3. Nombre sugerido: SIGRI Web Netlify.
4. Añade únicamente el permiso data.records:read.
5. En acceso a recursos, selecciona solo la base de SIGRI.
6. Crea el token y guárdalo en tu gestor de contraseñas. Después lo pegarás directamente en Netlify.
No lo subas a GitHub ni lo escribas en el código del navegador.

Para obtener AIRTABLE_BASE_ID, abre la base. El identificador comienza con app y aparece en la URL de la base. No uses el identificador de una tabla (tbl) o de una vista (viw).

## 4. Subir el código a GitHub
1. En https://github.com/new crea un repositorio privado llamado sigri-web.
2. Abre el repositorio y elige Upload files o Add file > Upload files.
3. Arrastra el CONTENIDO de la carpeta SIGRI-Netlify. No subas el ZIP ni la carpeta exterior completa.
4. Debes ver package.json y netlify.toml en la raíz del repositorio.
5. Comprueba que netlify/functions/consulta.mts y lib/consulta.ts también estén incluidos.
6. Confirma con Commit changes.

El archivo .env.example no contiene secretos y puede incluirse. Nunca subas .env.local, .env, node_modules ni archivos que contengan tu token.
No hace falta instalar Node.js ni herramientas de desarrollo en tu computadora si sigues este método: Netlify instala y compila el proyecto.

## 5. Importar el repositorio en Netlify
1. En https://app.netlify.com abre Add new project > Import an existing project.
2. Selecciona GitHub y autoriza el acceso al repositorio sigri-web.
3. Selecciona la rama main.
4. Confirma estos valores:

| Ajuste | Valor |
|---|---|
| Base directory | Vacío, si package.json está en la raíz |
| Build command | npm run build |
| Publish directory | dist |
| Functions directory | netlify/functions |
| Node.js | 24, definido en netlify.toml |

netlify.toml ya contiene esta configuración.
No selecciones Next.js ni Vinext: este paquete está adaptado a Vite y Netlify Functions.
Publica. La web puede mostrarse antes de configurar Airtable; el formulario informará que la consulta no está disponible.

## 6. Configurar Airtable en Netlify
Ve a Project configuration > Environment variables.
Agrega las variables de la tabla. Para las variables de Airtable, permite el ámbito Functions o All scopes y el contexto Production.
Si usas una vista previa de despliegue para probar, autoriza también su contexto de manera explícita.

| Variable | Valor |
|---|---|
| AIRTABLE_TOKEN | Tu token privado de Airtable |
| AIRTABLE_BASE_ID | El ID de tu base que empieza por app |
| AIRTABLE_TABLE_NAME | Seguimiento |
| AIRTABLE_VIEW_NAME | 01 DATOS DE LA EMPRESA |
| AIRTABLE_FIELD_FOLIO | Folio |
| AIRTABLE_FIELD_ETAPA | Etapa |
| AIRTABLE_FIELD_TAREA | Tarea |
| AIRTABLE_FIELD_AVANCE | Porcentaje |
| AIRTABLE_PROGRESS_SCALE | fraction o percent, según el paso 2 |

Si los nombres reales son distintos, escribe los nombres exactos de tu base.
Marca AIRTABLE_TOKEN como secreto si la interfaz ofrece esa opción.
No añadas el prefijo VITE_ a ninguna de estas variables: los secretos deben permanecer en el servidor.
Deja AIRTABLE_FIELD_ACTUALIZADO y AIRTABLE_FIELD_OBSERVACION sin configurar a menos que decidas mostrar campos públicos específicos.

Después de guardar, ve a Deploys y ejecuta Trigger deploy / Deploy project para hacer un nuevo despliegue.
Los cambios de variables deben aplicarse a una nueva publicación.

## 7. Comprobar que las consultas funcionan
En la dirección temporal https://NOMBRE-DEL-PROYECTO.netlify.app:
1. Comprueba la portada, las órbitas y el barrido de la sección Nosotros.
2. Abre «Consulta tu carpeta».
3. Escribe el folio exacto de un registro conocido que aparezca en la vista configurada.
4. Compara Etapa, Tarea y Porcentaje con Airtable.
5. Escribe un folio inexistente: debe mostrar «Revisa tu folio».
6. Comprueba un registro sin porcentaje: debe mostrar «Sin dato».
7. Revisa la página en tu teléfono.

El archivo consulta.mts declara la ruta /api/consulta y la regla de límite por IP/dominio.
En Netlify, comprueba en la sección Functions que se haya desplegado la función consulta.
No basta con arrastrar la carpeta dist al cargador de sitios estáticos: necesitas que también se compile y despliegue la función, lo cual hace la importación desde GitHub.

## 8. Conectar sigri.net después de la prueba
1. Dentro del proyecto de Netlify, abre Domain management > Production domains.
2. Añade sigri.net.
3. Consulta Pending DNS verification para obtener los registros concretos de tu proyecto.
4. En Hostinger, abre la administración DNS del dominio y aplica esos registros web; incluye www si Netlify lo indica.
5. Conserva los registros de correo MX, SPF, DKIM y DMARC.
6. Espera la verificación DNS y comprueba que HTTPS esté activo.
7. Prueba nuevamente un folio desde https://sigri.net.
8. Solo después de verificar la web y el correo, evalúa desactivar la próxima renovación del alojamiento de Hostinger. El dominio y el servicio de correo se siguen renovando por separado.

## Problemas comunes
| Síntoma | Qué revisar |
|---|---|
| La página funciona pero la consulta no | Que exista Functions > consulta, las variables estén disponibles para Functions y hayas desplegado de nuevo |
| No encuentra un folio existente | Folio exacto, tabla, vista y filtros de la vista |
| El porcentaje aparece incorrecto o como «Sin dato» | AIRTABLE_PROGRESS_SCALE y el tipo real del campo |
| «Necesitamos revisar tu folio» | Hay más de un registro con ese folio; corregir el duplicado |
| «Consulta no disponible» | Token, permiso data.records:read, acceso a la base, ID, nombres de campos y disponibilidad de Airtable |
| «Espera un momento» | Límite temporal de consultas; espera 60 segundos |
| La compilación no encuentra package.json | Subiste la carpeta exterior: coloca los archivos en la raíz o configura Base directory |
| Las animaciones no se mueven | Revisa la opción «reducir movimiento» del sistema |
| /api/consulta da 405 al abrirlo directamente | Es normal: la consulta debe enviarse desde el formulario mediante POST |

No guardes información personal, pagos ni documentos privados en los campos públicos de seguimiento. El acceso por folio no autentica la identidad del cliente.
El límite por IP reduce abuso; no equivale a un límite global compartido de la base. El tráfico de otros sistemas también consume la API de Airtable.

## Desarrollo local opcional
Node.js 24.
- npm install
- npm test
- npm run build
- npm run dev: únicamente la web; la consulta requiere Netlify Functions.
- Para emular Netlify y sus funciones, usa Netlify CLI (netlify dev) con variables privadas locales.

## Fuentes oficiales consultadas
- Importar un repositorio: https://docs.netlify.com/start/quickstarts/deploy-from-repository/
- Vite: https://docs.netlify.com/build/frameworks/framework-setup-guides/vite/
- Funciones: https://docs.netlify.com/build/functions/get-started/
- Variables de funciones: https://docs.netlify.com/build/functions/environment-variables/
- Configuración de variables: https://docs.netlify.com/build/environment-variables/get-started/
- DNS externo: https://docs.netlify.com/manage/domains/configure-domains/configure-external-dns/
- Token Airtable: https://support.airtable.com/articles/9934989703-creating-personal-access-tokens
- IDs Airtable: https://support.airtable.com/articles/4688931572-finding-airtable-ids
- Límites de solicitudes: https://docs.netlify.com/manage/security/secure-access-to-sites/rate-limiting/

